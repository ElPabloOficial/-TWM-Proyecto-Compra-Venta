using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class escribir1
{
    public int id_calificacion { get; set; }

    public int id_producto { get; set; }

    public string id_usuario { get; set; } = null!;

    public virtual calificacion id_calificacionNavigation { get; set; } = null!;

    public virtual producto id_productoNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
