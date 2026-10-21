using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class crear2
{
    public int id_servicio { get; set; }

    public int id_lista { get; set; }

    public string id_usuario { get; set; } = null!;

    public virtual listadeseo id_listaNavigation { get; set; } = null!;

    public virtual servicio id_servicioNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
