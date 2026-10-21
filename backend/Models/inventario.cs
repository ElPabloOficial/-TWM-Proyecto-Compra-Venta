using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class inventario
{
    public int id { get; set; }

    public int stockminimo { get; set; }

    public int stockmaximo { get; set; }

    public string id_usuario { get; set; } = null!;

    public virtual ICollection<almacenar> almacenars { get; set; } = new List<almacenar>();

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
